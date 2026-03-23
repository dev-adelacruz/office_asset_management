# frozen_string_literal: true

class Users::AdminChangePasswordUsecase < ApplicationUsecase
  organize Users::ValidateAdminPasswordChangeInteractor,
           Users::PersistPasswordChangeInteractor
end
