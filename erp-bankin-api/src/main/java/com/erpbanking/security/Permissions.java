package com.erpbanking.security;

public final class Permissions {

    private Permissions() {}

    public static final String USER_MANAGE = "USER_MANAGE";
    public static final String ROLE_MANAGE = "ROLE_MANAGE";
    public static final String PERMISSION_MANAGE = "PERMISSION_MANAGE";

    public static final String CLIENT_CREATE = "CLIENT_CREATE";
    public static final String CLIENT_READ = "CLIENT_READ";
    public static final String CLIENT_UPDATE = "CLIENT_UPDATE";

    public static final String COMPTE_CREATE = "COMPTE_CREATE";
    public static final String COMPTE_READ = "COMPTE_READ";
    public static final String COMPTE_CLOSE = "COMPTE_CLOSE";

    public static final String TRANSACTION_CREATE = "TRANSACTION_CREATE";
    public static final String TRANSACTION_READ = "TRANSACTION_READ";
    public static final String TRANSACTION_VALIDATE = "TRANSACTION_VALIDATE";
    public static final String TRANSACTION_CANCEL = "TRANSACTION_CANCEL";

    public static final String CREDIT_REQUEST = "CREDIT_REQUEST";
    public static final String CREDIT_EVALUATE = "CREDIT_EVALUATE";
    public static final String CREDIT_APPROVE = "CREDIT_APPROVE";
    public static final String CREDIT_READ = "CREDIT_READ";

    public static final String COMPTA_REPORT = "COMPTA_REPORT";
    public static final String COMPTA_CLOSE = "COMPTA_CLOSE";
    public static final String COMPTA_READ = "COMPTA_READ";
}
