// ==UserScript==
// @name         WhatsApp Shortcuts
// @namespace    WA-Shortcuts
// @version      0.2
// @description  Adding shortcuts to WhatsApp web application.
// @author       lai32290
// @match        https://web.whatsapp.com/
// @require      https://cdnjs.cloudflare.com/ajax/libs/mousetrap/1.6.3/mousetrap.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let currentReply = null;

    const WhatsApp = {
        conversation : {
            currentConversationIndex: 0,
            totalConversationElements: 0,
        },

        findParent: function(el, sel) {
            while ((el = el.parentElement) && !((el.matches || el.matchesSelector).call(el, sel)));
            return el;
        },

        isLoading: function() {
            const input = this.getSearchInput();
            return input === null;
        },

        focusSearch: function() {
            this.getSearchInput().focus();
        },

        getSearchInput: function() {
            return document.querySelector('input._2zCfw');
        },

        getMessageInput: function() {
            return document.querySelector("._3FeAD > .selectable-text");
        },

        getPrevMessage() {
            if (currentReply === null || this.findParent.call(this, currentReply, "body") === null) {
                const messages = document.querySelectorAll(".FTBzM");
                return messages[messages.length - 1];
            }

            return currentReply.previousSibling;
        },

        getNextMessage() {
            if (currentReply === null || this.findParent.call(this, currentReply, "body") === null) {
                const messages = document.querySelectorAll(".FTBzM");
                return messages[messages.length - 1];
            }

            return currentReply.nextSibling;
        },

        getConversation(container) {
            return container.querySelector('div._2UaNq');
        },

        getConversations() {
            return this.getSidePanel().querySelectorAll('.X7YrQ');
        },

        getSortedConversations() {
            function getConversationTop(el) {
                return parseInt(el.style.transform.replace(/\D/g, ''));
            }

            const conversations = Array.apply(this, this.getConversations());

            return conversations.sort((elA, elB) => {
                const elATop = getConversationTop(elA);
                const elBTop = getConversationTop(elB);

                return elATop - elBTop;
            });
        },

        getCurrentConversation() {
            const conversations = Array.apply(this, this.getConversations());
            return conversations.find(el => el.querySelector('div._2UaNq._3mMX1'));
        },

        getSidePanel() {
            return document.querySelector('#pane-side');
        },

        getSearchButton() {
          return document.querySelector('#main ._3j8Pd:first-child > div[role=button]');
        },
    }

    function reactEventHandlers(element){
        const reactHandlerKey = Object.keys(element).filter(function(item){
            return item.indexOf('__reactEventHandlers')>=0
         });
        const reactHandler = element[reactHandlerKey[0]];
        return reactHandler;
    }

    function bindChangeOfConversation(){
        const event = new MouseEvent('onMouseDown', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });

        Mousetrap.bind(['alt+[', 'command+['], function() {
            try {
                const activedConversation = WhatsApp.getCurrentConversation();
                const sortedConversations = WhatsApp.getSortedConversations();
                const nextIndex = sortedConversations.indexOf(activedConversation);
                let nextConversationContainer = sortedConversations[ nextIndex + 1 ];

                if(!nextConversationContainer) {
                    nextConversationContainer = WhatsApp.getSortedConversations()[0];
                };

                const nextConversation = WhatsApp.getConversation(nextConversationContainer);
                const reactHandler = reactEventHandlers(nextConversation);
                reactHandler.onMouseDown(event);
            }
            catch(err){
                console.log(err);
            }
        });

        Mousetrap.bind(['alt+]', 'command+]'], function() {
            try{
                const activedConversation = WhatsApp.getCurrentConversation();
                const sortedConversations = WhatsApp.getSortedConversations();
                const nextIndex = sortedConversations.indexOf(activedConversation);
                let nextConversationContainer = sortedConversations[ nextIndex - 1 ];

                if(!nextConversationContainer) {
                    const sortedConversations = WhatsApp.getSortedConversations();
                    nextConversationContainer = sortedConversations[ sortedConversations.length - 1];
                };

                const nextConversation = WhatsApp.getConversation(nextConversationContainer);
                const reactHandler = reactEventHandlers(nextConversation);
                reactHandler.onMouseDown(event);
            }
            catch(err){
                console.log(err);
            }
        });
    }

    function doubleClick(selector, _element = null) {
        const element = _element || document.querySelector(selector);

        if (!element) return;

        const event = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });

        element.dispatchEvent(event);
    }

    function click(selector, _element = null) {
        const element = _element || document.querySelector(selector);

        if (!element) return;

        const event = new MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });

        element.dispatchEvent(event);
    }

    function bindSearch() {
        let input;
        while (input == null) {
            input = WhatsApp.getSearchInput();
        }

        Mousetrap.bind(['ctrl+/', 'command+/'], function() {
            WhatsApp.focusSearch();
        });
    }

    function bindChangeConversation() {
        Mousetrap.bind(['alt+up', 'alt+k', 'command+k', 'command+up'], function() {
            const message = WhatsApp.getPrevMessage();
            if (message) {
                doubleClick("", message);
                currentReply = message;
            }
        });

        Mousetrap.bind(['alt+down', 'alt+j', 'command+j', 'command+down'], function() {
            const message = WhatsApp.getNextMessage();
            if (message) {
                doubleClick("", message);
                currentReply = message;
            }
        });

        document.addEventListener("keyup", function(e) {
            if (e.target.classList.contains("_3u328")) {
                if (e.keyCode === 27 || e.keyCode === 13) {
                    currentReply = null;
                }
            }
        });
    }

    function bindSearchInConversation() {

        const event = new MouseEvent('onMouseDown', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });

        Mousetrap.bind(['alt+;', 'command+;'], function() {
            const searchButton = WhatsApp.getSearchButton();
            if (searchButton) {
                const reactHandler = reactEventHandlers(searchButton);
                reactHandler.onMouseDown(event);
            }
        });
    }

    function start() {
        if (WhatsApp.isLoading()) {
            setTimeout(start, 200);
            return;
        }

        bindSearch();
        bindChangeConversation();
        bindChangeOfConversation();
        bindSearchInConversation();

        document.addEventListener("keydown", function(e) {
            if (e.target.classList.contains("selectable-text")) {
                const input = WhatsApp.getMessageInput();
                input.classList.add("mousetrap");
            }
        });
    }

    start();
})();
