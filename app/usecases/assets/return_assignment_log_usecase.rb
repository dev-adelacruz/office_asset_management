# frozen_string_literal: true

class Assets::ReturnAssignmentLogUsecase < ApplicationUsecase
  organize Assets::ValidateReturnParamsInteractor,
           Assets::PersistReturnInteractor,
           Assets::EvaluateAssetAvailabilityInteractor,
           Assets::SetAssetStatusAvailableInteractor,
           Shared::RecordAuditLogInteractor
end
