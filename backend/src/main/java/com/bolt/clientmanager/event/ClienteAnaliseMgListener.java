package com.bolt.clientmanager.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ClienteAnaliseMgListener {

    @EventListener
    public void handleClienteAnaliseMgEvent(ClienteAnaliseMgEvent event) {
        log.info("[ANALISE_CLIENTE_MG] Cliente publicado para análise: ID = {}, Nome = {}, Documento = {}",
                event.getCliente().getId(),
                event.getCliente().getNome(),
                event.getCliente().getDocumento());
    }
}
