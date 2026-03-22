# frozen_string_literal: true

class Assets::CreateAssignmentLogUsecase < ApplicationUsecase
  organize Assets::ValidateAssignmentParamsInteractor,
           Assets::PersistAssignmentLogInteractor,
           Assets::SetAssetStatusAssignedInteractor,
           Shared::RecordAuditLogInteractor
end
