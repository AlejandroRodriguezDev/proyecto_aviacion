// src/pages/MessagesPage.js
import React from 'react';
import styles from './MessagesPage.module.css';


const MessagesPage = () => {

  const conversations = [{id: '1', user: {username: 'SimAviator'}}, {id: '2', user: {username:'PilotPete'}}]; // Mock
  const selectedConversationId = '1'; // Mock

  return (
    <div className={styles.messagesLayout}>
      <aside className={styles.conversationList}>
         <h3>Conversaciones</h3>
         {/* Placeholder para ConversationList */}
         <ul>
           {conversations.map(conv => <li key={conv.id}>@{conv.user.username}</li>)}
         </ul>
         <button>Nueva Conversación</button>
      </aside>
      <main className={styles.messageWindow}>
        {selectedConversationId ? (
            <div>
                <h3>Mensajes con @SimAviator</h3> {/* Mock */}
                <div className={styles.messagesArea}>
                   {/* Placeholder Mensajes */}
                   <p>Hola!</p>
                   <p style={{textAlign: 'right'}}>¡Hola!</p>
                </div>
                {/* Placeholder Input */}
                <textarea placeholder="Escribe un mensaje..."></textarea>
                <button>Enviar</button>
            </div>
        ) : (
            <p className={styles.noConversation}>Selecciona una conversación o inicia una nueva.</p>
        )}
      </main>
    </div>
  );
};

export default MessagesPage;