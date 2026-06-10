package com.bolt.clientmanager.event;

import com.bolt.clientmanager.model.Cliente;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ClienteAnaliseMgEvent extends ApplicationEvent {
    
    private final Cliente cliente;

    public ClienteAnaliseMgEvent(Object source, Cliente cliente) {
        super(source);
        this.cliente = cliente;
    }
}
