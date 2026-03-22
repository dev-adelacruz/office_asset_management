# frozen_string_literal: true

class Licenses::AssignLicenseSeatUsecase < ApplicationUsecase
  organize Licenses::ValidateUserExistsInteractor,
           Licenses::ValidateSeatAvailabilityInteractor,
           Licenses::PersistLicenseSeatInteractor
end
