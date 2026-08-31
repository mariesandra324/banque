package com.erpbanking.compte.service;

import org.springframework.stereotype.Service;

import java.math.BigInteger;

@Service
public class RibService {

    public static final String CODE_BANQUE = "00090";
    //public static final String CODE_GUICHET = "00001";
    private static final String CODE_PAYS = "MG";

    /**
     * clé = 97 - ((89 * banque + 15 * guichet + 3 * compte) mod 97)
     */
    public String calculerCleRib(String codeBanque, String codeGuichet, String numeroCompte) {
        long banque = Long.parseLong(codeBanque);
        long guichet = Long.parseLong(codeGuichet);
        long compte = Long.parseLong(numeroCompte);

        long cle = 97 - ((89 * banque + 15 * guichet + 3 * compte) % 97);
        return String.format("%02d", cle);
    }

    public String genererIban(String codeBanque, String codeGuichet, String numeroCompte, String cleRib) {
        String ribComplet = codeBanque + codeGuichet + numeroCompte + cleRib;

        String chaineControle = ribComplet + convertirEnNumerique(CODE_PAYS) + "00";
        BigInteger nombre = new BigInteger(chaineControle);
        int cleIban = 98 - nombre.mod(BigInteger.valueOf(97)).intValue();

        return CODE_PAYS + String.format("%02d", cleIban) + ribComplet;
    }

    private String convertirEnNumerique(String lettres) {
        StringBuilder sb = new StringBuilder();
        for (char c : lettres.toCharArray()) {
            sb.append(Character.getNumericValue(c));
        }
        return sb.toString();
    }
}