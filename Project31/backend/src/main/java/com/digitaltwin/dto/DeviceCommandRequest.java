package com.digitaltwin.dto;

public class DeviceCommandRequest {

    private String deviceCode;
    private String commandType;
    private String commandData;
    private String operator;

    public String getDeviceCode() { return deviceCode; }
    public void setDeviceCode(String deviceCode) { this.deviceCode = deviceCode; }

    public String getCommandType() { return commandType; }
    public void setCommandType(String commandType) { this.commandType = commandType; }

    public String getCommandData() { return commandData; }
    public void setCommandData(String commandData) { this.commandData = commandData; }

    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
}
