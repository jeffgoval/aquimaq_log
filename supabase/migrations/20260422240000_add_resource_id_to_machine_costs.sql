ALTER TABLE machine_costs
  ADD COLUMN IF NOT EXISTS resource_id uuid REFERENCES log_resources(id) ON DELETE SET NULL;
COMMENT ON COLUMN machine_costs.resource_id IS 'Equipamento (log_resources) ao qual o custo se refere, alternativo a tractor_id/truck_id.';
