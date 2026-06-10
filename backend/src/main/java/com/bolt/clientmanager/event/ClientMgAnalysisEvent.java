package com.bolt.clientmanager.event;

import com.bolt.clientmanager.model.Client;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ClientMgAnalysisEvent extends ApplicationEvent {
    
    private final Client client;

    public ClientMgAnalysisEvent(Object source, Client client) {
        super(source);
        this.client = client;
    }
}
