# frozen_string_literal: true

class AssetRequests::CreateAssetRequestUsecase < ApplicationUsecase
  organize AssetRequests::ValidateAssetRequestParamsInteractor,
           AssetRequests::PersistAssetRequestInteractor,
           AssetRequests::LogAssetRequestStatusInteractor,
           Shared::RecordAuditLogInteractor
end
