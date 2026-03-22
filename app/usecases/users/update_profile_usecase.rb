# frozen_string_literal: true

class Users::UpdateProfileUsecase < ApplicationUsecase
  organize Users::ValidateProfileUpdateAuthorizationInteractor,
           Users::PersistProfileInteractor
end
