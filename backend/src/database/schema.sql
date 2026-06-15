-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  id_number VARCHAR(50) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('super_admin', 'group_admin', 'member')),
  two_fa_enabled BOOLEAN DEFAULT false,
  two_fa_secret VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_status (status)
);

-- Groups Table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  admin_id UUID NOT NULL REFERENCES users(id),
  monthly_contribution DECIMAL(15,2) NOT NULL,
  max_members INTEGER DEFAULT 100,
  current_members INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  reserve_fund_percentage DECIMAL(5,2) DEFAULT 5.00,
  penalty_first_miss DECIMAL(5,2) DEFAULT 10.00,
  penalty_second_miss DECIMAL(5,2) DEFAULT 5.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_admin_id (admin_id),
  INDEX idx_status (status)
);

-- Group Members Table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  contribution_count INTEGER DEFAULT 0,
  missed_contributions INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'removed')),
  joined_at TIMESTAMP DEFAULT NOW(),
  removed_at TIMESTAMP,
  UNIQUE(group_id, user_id),
  INDEX idx_group_id (group_id),
  INDEX idx_user_id (user_id)
);

-- Wallet Table (User Balance)
CREATE TABLE IF NOT EXISTS wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(15,2) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'contribution', 'penalty', 'refund')),
  transaction_id UUID,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Chamaa Fund Table
CREATE TABLE IF NOT EXISTS chamaa_fund (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id),
  cycle_number INTEGER NOT NULL,
  total_amount DECIMAL(15,2) DEFAULT 0,
  cycle_start_date DATE NOT NULL,
  cycle_end_date DATE NOT NULL,
  payout_member_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'closed')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, cycle_number),
  INDEX idx_group_id (group_id),
  INDEX idx_status (status)
);

-- Contributions Table
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  group_id UUID NOT NULL REFERENCES groups(id),
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_ref VARCHAR(255),
  due_date DATE NOT NULL,
  paid_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_group_id (group_id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date)
);

-- Missed Contributions Table
CREATE TABLE IF NOT EXISTS missed_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  group_id UUID NOT NULL REFERENCES groups(id),
  contribution_id UUID REFERENCES contributions(id),
  miss_count INTEGER NOT NULL,
  fine_amount DECIMAL(15,2) NOT NULL,
  fine_status VARCHAR(50) DEFAULT 'pending' CHECK (fine_status IN ('pending', 'paid', 'waived')),
  app_share DECIMAL(15,2),
  member_share DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_group_id (group_id),
  INDEX idx_fine_status (fine_status)
);

-- Reserve Fund Table
CREATE TABLE IF NOT EXISTS reserve_fund (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id),
  amount DECIMAL(15,2) NOT NULL,
  source VARCHAR(50) NOT NULL CHECK (source IN ('contribution_percentage', 'penalty', 'manual')),
  transaction_id UUID,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_group_id (group_id)
);

-- Withdrawals Table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(15,2) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('instant', 'chamaa')),
  tax DECIMAL(15,2) DEFAULT 0,
  penalty DECIMAL(15,2) DEFAULT 0,
  net_amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  phone VARCHAR(20) NOT NULL,
  transaction_ref VARCHAR(255),
  failure_reason TEXT,
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_requested_at (requested_at)
);

-- Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id),
  initiator_id UUID NOT NULL REFERENCES users(id),
  description TEXT NOT NULL,
  evidence_url VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  INDEX idx_group_id (group_id),
  INDEX idx_status (status)
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);

-- Payout Schedule Table
CREATE TABLE IF NOT EXISTS payout_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id),
  payout_order INTEGER NOT NULL,
  member_id UUID NOT NULL REFERENCES users(id),
  scheduled_date DATE NOT NULL,
  amount DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, payout_order),
  INDEX idx_group_id (group_id),
  INDEX idx_status (status)
);

-- Two-Factor Authentication Tokens
CREATE TABLE IF NOT EXISTS two_fa_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  token_hash VARCHAR(255) NOT NULL,
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  phone VARCHAR(20) NOT NULL,
  provider VARCHAR(50) NOT NULL DEFAULT 'mpesa',
  is_primary BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id)
);

-- Session Table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
  read BOOLEAN DEFAULT false,
  action_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_read (read),
  INDEX idx_created_at (created_at)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_wallet_user_created ON wallet(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributions_group_status ON contributions(group_id, status);
CREATE INDEX IF NOT EXISTS idx_group_members_group_status ON group_members(group_id, status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_status ON withdrawals(user_id, status);

-- Create view for group statistics
CREATE OR REPLACE VIEW group_statistics AS
SELECT 
  g.id,
  g.name,
  COUNT(DISTINCT gm.id) as member_count,
  COUNT(DISTINCT CASE WHEN gm.status = 'active' THEN gm.id END) as active_members,
  SUM(CASE WHEN c.status = 'completed' THEN c.amount ELSE 0 END) as total_contributions,
  COUNT(DISTINCT CASE WHEN mc.id IS NOT NULL THEN mc.id END) as missed_count,
  COALESCE(SUM(rf.amount), 0) as reserve_balance
FROM groups g
LEFT JOIN group_members gm ON g.id = gm.group_id
LEFT JOIN contributions c ON g.id = c.group_id
LEFT JOIN missed_contributions mc ON g.id = mc.group_id
LEFT JOIN reserve_fund rf ON g.id = rf.group_id
GROUP BY g.id, g.name;
