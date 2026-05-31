package com.silvercare.config;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.Date;

@Component
@MappedTypes(Date.class)
public class DateTypeHandler extends BaseTypeHandler<Date> {

    private static final String DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Date parameter, JdbcType jdbcType) throws SQLException {
        SimpleDateFormat sdf = new SimpleDateFormat(DATE_FORMAT);
        ps.setString(i, sdf.format(parameter));
    }

    @Override
    public Date getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String dateStr = rs.getString(columnName);
        return parseDate(dateStr);
    }

    @Override
    public Date getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String dateStr = rs.getString(columnIndex);
        return parseDate(dateStr);
    }

    @Override
    public Date getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String dateStr = cs.getString(columnIndex);
        return parseDate(dateStr);
    }

    private Date parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) {
            return null;
        }
        try {
            SimpleDateFormat sdf = new SimpleDateFormat(DATE_FORMAT);
            return sdf.parse(dateStr);
        } catch (Exception e) {
            try {
                return new Date(Long.parseLong(dateStr));
            } catch (Exception e2) {
                return null;
            }
        }
    }
}
