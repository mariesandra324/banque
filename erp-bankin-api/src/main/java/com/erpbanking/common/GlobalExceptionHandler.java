package com.erpbanking.common;

import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.erpbanking.common.exception.DuplicateResourceException;


@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleNotFound(
            ResourceNotFoundException exception
    ){

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                    ApiResponse.error(
                        exception.getMessage()
                    )
                );

    }



    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGlobal(
            Exception exception
    ){

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                    ApiResponse.error(
                        "Erreur interne du serveur"
                    )
                );

    }
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse> handleRuntime(
            RuntimeException exception
    ){
 
        log.warn("Erreur métier non catégorisée : {}", exception.getMessage());
 
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                    ApiResponse.error(
                        exception.getMessage()
                    )
                );
 
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(
            MethodArgumentNotValidException exception
    ){

        Map<String, String> erreursParChamp = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(fieldError ->
                erreursParChamp.put(fieldError.getField(), fieldError.getDefaultMessage())
        );

        String message = erreursParChamp.entrySet().stream()
                .map(e -> e.getKey() + " : " + e.getValue())
                .collect(Collectors.joining(" ; "));

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                    ApiResponse.error(
                        message.isBlank() ? "Données invalides." : message
                    )
                );
  
    }


    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse> handleDataIntegrity(
            DataIntegrityViolationException exception
    ){

        log.warn("Contrainte de base de données violée : {}", exception.getMessage());

        String sqlState = sqlStateDe(exception);
        String cause = exception.getMostSpecificCause().getMessage();

        // SQLState PostgreSQL : on se base sur le code et non sur le texte.
        // Le DETAIL de PostgreSQL recopie la ligne entière en échec, qui contient
        // "null" presque toujours : un test contains("null") sur le message
        // classait donc n'importe quelle violation comme un champ manquant.
        if ("23505".equals(sqlState)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(
                            "Cette valeur existe déjà (contrainte d'unicité)."));
        }

        if ("23502".equals(sqlState)) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(
                            "Un champ obligatoire est manquant ou nul. Détail : " + cause));
        }

        if ("23514".equals(sqlState)) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(
                            "Valeur refusée par une contrainte de la base. "
                            + "Vérifiez que les énumérations utilisées sont bien autorisées."));
        }

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                    ApiResponse.error(
                        "L'opération viole une contrainte de base de données."
                    )
                );
  
    }

    /**
     * Remonte jusqu'au SQLState de la violation (code d'erreur PostgreSQL),
     * absent des messages traduits.
     */
    private String sqlStateDe(Throwable exception) {
        Throwable courant = exception;

        while (courant != null) {
            if (courant instanceof SQLException sqlException
                    && sqlException.getSQLState() != null) {
                return sqlException.getSQLState();
            }
            courant = courant.getCause();
        }

        return null;
    }


    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse> handleDuplicate(
            DuplicateResourceException exception
    ){
 
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                    ApiResponse.error(
                        exception.getMessage()
                    )
                );
 
    }
}
