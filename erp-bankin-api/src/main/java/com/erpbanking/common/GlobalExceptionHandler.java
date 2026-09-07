package com.erpbanking.common;

import java.util.LinkedHashMap;
import java.util.Map;
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
 
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                    ApiResponse.error(
                        "Données invalides."
                    )
                );
 
    }


    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse> handleDataIntegrity(
            DataIntegrityViolationException exception
    ){
 
        log.warn("Contrainte de base de données violée : {}", exception.getMessage());
 
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                    ApiResponse.error(
                        "Cette opération viole une contrainte d'unicité (donnée déjà existante)."
                    )
                );
 
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
