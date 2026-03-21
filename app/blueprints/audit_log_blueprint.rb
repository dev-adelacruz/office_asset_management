# frozen_string_literal: true

class AuditLogBlueprint < Blueprinter::Base
  identifier :id

  fields :action, :auditable_type, :auditable_id, :changes_before, :changes_after, :created_at

  association :actor, blueprint: UserBlueprint
end
