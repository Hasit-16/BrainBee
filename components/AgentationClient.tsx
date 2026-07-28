'use client';

import React from 'react';
import { Agentation } from 'agentation';

export default function AgentationClient() {
  return (
    <Agentation
      endpoint="http://localhost:4747"
      onSessionCreated={(sessionId: string) => {
        console.log('Agentation session initialized:', sessionId);
      }}
    />
  );
}
