# frozen_string_literal: true

class Licenses::UpdateLicenseUsecase < ApplicationUsecase
  organize Licenses::ValidateLicenseParamsInteractor,
           Licenses::PersistLicenseInteractor,
           Shared::RecordAuditLogInteractor
end
