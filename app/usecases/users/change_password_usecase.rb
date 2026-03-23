# frozen_string_literal: true

class Users::ChangePasswordUsecase < ApplicationUsecase
  organize Users::ValidateCurrentPasswordInteractor,
           Users::PersistPasswordChangeInteractor
end
