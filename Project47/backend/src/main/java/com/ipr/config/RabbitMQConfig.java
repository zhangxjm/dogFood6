package com.ipr.config;

import org.springframework.amqp.core.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${ipr.rabbitmq.exchange}")
    private String exchange;

    @Value("${ipr.rabbitmq.queue.monitoring}")
    private String monitoringQueue;

    @Value("${ipr.rabbitmq.queue.evidence}")
    private String evidenceQueue;

    @Value("${ipr.rabbitmq.queue.legal}")
    private String legalQueue;

    @Value("${ipr.rabbitmq.routing.monitoring}")
    private String monitoringRouting;

    @Value("${ipr.rabbitmq.routing.evidence}")
    private String evidenceRouting;

    @Value("${ipr.rabbitmq.routing.legal}")
    private String legalRouting;

    @Bean
    public DirectExchange iprExchange() {
        return new DirectExchange(exchange, true, false);
    }

    @Bean
    public Queue monitoringQueue() {
        return QueueBuilder.durable(monitoringQueue)
                .withArgument("x-dead-letter-exchange", exchange + ".dlx")
                .withArgument("x-dead-letter-routing-key", "dlx.monitoring")
                .build();
    }

    @Bean
    public Queue evidenceQueue() {
        return QueueBuilder.durable(evidenceQueue)
                .withArgument("x-dead-letter-exchange", exchange + ".dlx")
                .withArgument("x-dead-letter-routing-key", "dlx.evidence")
                .build();
    }

    @Bean
    public Queue legalQueue() {
        return QueueBuilder.durable(legalQueue)
                .withArgument("x-dead-letter-exchange", exchange + ".dlx")
                .withArgument("x-dead-letter-routing-key", "dlx.legal")
                .build();
    }

    @Bean
    public Binding monitoringBinding(Queue monitoringQueue, DirectExchange iprExchange) {
        return BindingBuilder.bind(monitoringQueue).to(iprExchange).with(monitoringRouting);
    }

    @Bean
    public Binding evidenceBinding(Queue evidenceQueue, DirectExchange iprExchange) {
        return BindingBuilder.bind(evidenceQueue).to(iprExchange).with(evidenceRouting);
    }

    @Bean
    public Binding legalBinding(Queue legalQueue, DirectExchange iprExchange) {
        return BindingBuilder.bind(legalQueue).to(iprExchange).with(legalRouting);
    }
}
