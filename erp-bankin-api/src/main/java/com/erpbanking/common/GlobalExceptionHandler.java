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
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.erpbanking.common.exception.DuplicateResourceException;

import jakarta.validation.ConstraintViolationException;


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

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse> handleConstraintViolation(
            ConstraintViolationException exception
    ){

        String message = exception.getConstraintViolations().stream()
                .map(violation -> violation.getPropertyPath() + " : " + violation.getMessage())
                .collect(Collectors.joining(" ; "));

        return reponseBadRequest(
                message.isBlank() ? "Données invalides." : message
        );

    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException exception
    ){

        return reponseBadRequest(
                "La valeur fournie pour le paramètre '" + exception.getName() + "' est invalide."
        );

    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse> handleUnreadableMessage(
            HttpMessageNotReadableException exception
    ){

        return reponseBadRequest(
                "Le corps de la requête est invalide ou mal formé."
        );

    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse> handleMissingParameter(
            MissingServletRequestParameterException exception
    ){

        return reponseBadRequest(
                "Le paramètre '" + exception.getParameterName() + "' est obligatoire."
        );

    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException exception
    ){

        return ResponseEntity
                .status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(
                    ApiResponse.error(
                        "Méthode HTTP non autorisée pour cette ressource."
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
                            "Un champ obligatoire est manquant ou nul."));
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

    private ResponseEntity<ApiResponse> reponseBadRequest(String message) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                    ApiResponse.error(message)
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
