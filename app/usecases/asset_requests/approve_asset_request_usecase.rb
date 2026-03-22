# frozen_string_literal: true

class AssetRequests::ApproveAssetRequestUsecase < ApplicationUsecase
  organize AssetRequests::ValidateApprovalAuthorizationInteractor,
           AssetRequests::PersistApprovalInteractor,
           AssetRequests::LogAssetRequestStatusInteractor,
           Shared::RecordAuditLogInteractor
end
