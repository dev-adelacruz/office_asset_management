# frozen_string_literal: true

class Users::ConfirmEmailUsecase < ApplicationUsecase
  organize Users::ValidateEmailConfirmationTokenInteractor,
           Users::PersistEmailConfirmationInteractor
end
