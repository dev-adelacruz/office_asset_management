# frozen_string_literal: true

class Users::AdminChangeEmailUsecase < ApplicationUsecase
  organize Users::ValidateAdminEmailChangeInteractor,
           Users::PersistEmailChangeRequestInteractor
end
