package com.ttc.common.exception;

import lombok.Data;

@Data
public class BusinessException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    private Integer code;
    private String msg;

    public BusinessException(String msg) {
        super(msg);
        this.code = 500;
        this.msg = msg;
    }

    public BusinessException(Integer code, String msg) {
        super(msg);
        this.code = code;
        this.msg = msg;
    }
}
