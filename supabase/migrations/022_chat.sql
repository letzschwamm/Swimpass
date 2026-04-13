-- 022_chat.sql
-- In-App Chat: conversations + messages between staff and parents/participants

-- ── conversations ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id              UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_role            TEXT        NOT NULL CHECK (user_role IN ('parent','participant')),
  last_message_preview TEXT        NOT NULL DEFAULT '',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (instructor_id, user_id)
);

-- ── messages ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID        NOT NULL REFERENCES profiles(id)       ON DELETE CASCADE,
  sender_role     TEXT        NOT NULL,
  content         TEXT        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  read            BOOLEAN     NOT NULL DEFAULT false
);

-- REPLICA IDENTITY FULL so Realtime UPDATE events expose changed columns
ALTER TABLE messages REPLICA IDENTITY FULL;

-- ── indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_messages_conv_time    ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conv_instructor_time  ON conversations(instructor_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_user             ON conversations(user_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;

-- Conversations: full access for both parties
CREATE POLICY "conv_all" ON conversations
  FOR ALL
  USING     (auth.uid() = instructor_id OR auth.uid() = user_id)
  WITH CHECK(auth.uid() = instructor_id OR auth.uid() = user_id);

-- Messages: select
CREATE POLICY "msg_select" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.instructor_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

-- Messages: insert (only own sender_id)
CREATE POLICY "msg_insert" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.instructor_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

-- Messages: update (mark as read — anyone in the conversation can update)
CREATE POLICY "msg_update" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.instructor_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

-- ── Realtime ─────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
