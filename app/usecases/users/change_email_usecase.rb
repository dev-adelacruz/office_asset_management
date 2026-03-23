# frozen_string_literal: true

class Users::ChangeEmailUsecase < ApplicationUsecase
  organize Users::ValidateEmailChangeParamsInteractor,
           Users::PersistEmailChangeRequestInteractor
end
