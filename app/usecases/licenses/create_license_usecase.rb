# frozen_string_literal: true

class Licenses::CreateLicenseUsecase < ApplicationUsecase
  organize Licenses::ValidateLicenseParamsInteractor,
           Licenses::PersistLicenseInteractor
end
