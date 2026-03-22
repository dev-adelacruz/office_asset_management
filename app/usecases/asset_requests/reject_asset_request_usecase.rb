# frozen_string_literal: true

class AssetRequests::RejectAssetRequestUsecase < ApplicationUsecase
  organize AssetRequests::ValidateRejectionNoteInteractor,
           AssetRequests::ValidateApprovalAuthorizationInteractor,
           AssetRequests::PersistRejectionInteractor,
           AssetRequests::LogAssetRequestStatusInteractor
end
