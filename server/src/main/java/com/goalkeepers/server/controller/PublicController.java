package com.goalkeepers.server.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
public class PublicController {
    
    @RequestMapping("/")
    public String main() {
        return "index";
    }
    
}
