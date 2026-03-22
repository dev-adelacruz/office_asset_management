# frozen_string_literal: true

# Auditable callbacks removed in OAM2-64.
# Audit logging is now handled by Shared::RecordAuditLogInteractor.
module Auditable
  extend ActiveSupport::Concern
end
