package com.erpbanking.security;

public final class Permissions {

    private Permissions() {}

    public static final String USER_MANAGE = "USER_MANAGE";
    public static final String ROLE_MANAGE = "ROLE_MANAGE";
    public static final String PERMISSION_MANAGE = "PERMISSION_MANAGE";

    public static final String CLIENT_CREATE = "CLIENT_CREATE";
    public static final String CLIENT_VIEW = "CLIENT_VIEW";
    public static final String CLIENT_UPDATE = "CLIENT_UPDATE";
    public static final String CLIENT_DELETE = "CLIENT_DELETE";

    public static final String ACCOUNT_CREATE = "ACCOUNT_CREATE";
    public static final String ACCOUNT_VIEW = "ACCOUNT_VIEW";
    public static final String ACCOUNT_UPDATE = "ACCOUNT_UPDATE";
    public static final String ACCOUNT_DELETE = "ACCOUNT_DELETE";

    public static final String TRANSACTION_CREATE = "TRANSACTION_CREATE";
    public static final String TRANSACTION_VIEW = "TRANSACTION_VIEW";
    public static final String TRANSACTION_HISTORY = "TRANSACTION_HISTORY";
    public static final String TRANSACTION_VALIDATE = "TRANSACTION_VALIDATE";

    public static final String REPORT_VIEW = "REPORT_VIEW";
}
