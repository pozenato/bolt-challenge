package com.bolt.clientmanager.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ClientMgAnalysisListener {

    @EventListener
    public void handleClientMgAnalysisEvent(ClientMgAnalysisEvent event) {
        log.info("[analise_cliente_mg] Client published to topic for analysis: ID = {}, Name = {}, Document = {}",
                event.getClient().getId(),
                event.getClient().getName(),
                event.getClient().getDocument());
    }
}
