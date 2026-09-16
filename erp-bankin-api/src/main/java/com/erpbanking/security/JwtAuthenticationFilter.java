package com.erpbanking.security;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.erpbanking.client.entity.Client;
import com.erpbanking.client.repository.ClientRepository;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Intercepte chaque requête HTTP, extrait le JWT du header Authorization,
 * et reconstruit l'Authentication (avec les autorités / permissions)
 * dans le SecurityContext, pour que les @PreAuthorize fonctionnent.
 *
 * Deux types de token sont gérés :
 *  - token du personnel (/api/auth/login) : subject = email d'un Utilisateur
 *  - token mobile (/api/auth/mobile/login) : claim type=CLIENT + clientId
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final ClientRepository clientRepository;

    private static final String HEADER_NAME = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private static final String CLAIM_TYPE = "type";
    private static final String TYPE_CLIENT = "CLIENT";
    private static final String CLAIM_CLIENT_ID = "clientId";

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader(HEADER_NAME);

        // Pas de header ou pas au format "Bearer xxx" -> on laisse passer,
        // la requête sera de toute façon rejetée plus loin si la route est protégée.
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(BEARER_PREFIX.length());

        if (SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = null;

            try {
                Claims claims = jwtService.extractAllClaims(jwt);
                String type = claims.get(CLAIM_TYPE, String.class);

                if (TYPE_CLIENT.equalsIgnoreCase(type)) {
                    // Token mobile : le subject est l'email du CLIENT,
                    // et le claim clientId référence la table "clients".
                    Long clientId = claims.get(CLAIM_CLIENT_ID, Long.class);
                    if (clientId != null) {
                        Client client = clientRepository.findById(clientId).orElse(null);
                        if (client != null) {
                            userDetails = new ClientUserDetails(client);
                        }
                    }
                } else {
                    // Token du personnel (Utilisateur)
                    String userEmail = claims.getSubject();
                    if (userEmail != null) {
                        userDetails = userDetailsService.loadUserByUsername(userEmail);
                    }
                }
            } catch (Exception e) {
                // Token invalide / expiré / client introuvable
                // -> on laisse passer sans authentification, la sécurité rejettera la requête.
            }

            if (userDetails != null && jwtService.isTokenValid(jwt, userDetails)) {

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities() // <-- les permissions/rôles injectés ici
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}