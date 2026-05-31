package com.ttc.common.constant;

public class CommonConstants {
    public static final String SUCCESS = "success";
    public static final String FAIL = "fail";

    public static final Integer COMMAND_STATUS_PENDING = 0;
    public static final Integer COMMAND_STATUS_SENDING = 1;
    public static final Integer COMMAND_STATUS_EXECUTING = 2;
    public static final Integer COMMAND_STATUS_SUCCESS = 3;
    public static final Integer COMMAND_STATUS_FAILED = 4;
    public static final Integer COMMAND_STATUS_TIMEOUT = 5;

    public static final Integer PAYLOAD_STATUS_NORMAL = 0;
    public static final Integer PAYLOAD_STATUS_ABNORMAL = 1;
    public static final Integer PAYLOAD_STATUS_FUSED = 2;

    public static final String ROCKETMQ_TOPIC_COMMAND = "ttc-command-topic";
    public static final String ROCKETMQ_TOPIC_PAYLOAD = "ttc-payload-topic";
    public static final String ROCKETMQ_TOPIC_ALERT = "ttc-alert-topic";
    public static final String ROCKETMQ_CONSUMER_GROUP_COMMAND = "ttc-command-group";
    public static final String ROCKETMQ_CONSUMER_GROUP_PAYLOAD = "ttc-payload-group";
    public static final String ROCKETMQ_CONSUMER_GROUP_ALERT = "ttc-alert-group";

    public static final String REDIS_LOCK_PREFIX = "ttc:lock:";
    public static final String REDIS_KEY_PREFIX_COMMAND = "ttc:command:";
    public static final String REDIS_KEY_PREFIX_PAYLOAD = "ttc:payload:";
    public static final Long REDIS_LOCK_EXPIRE_TIME = 30L;
}
