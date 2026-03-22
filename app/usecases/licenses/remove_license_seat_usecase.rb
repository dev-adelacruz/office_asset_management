# frozen_string_literal: true

class Licenses::RemoveLicenseSeatUsecase < ApplicationUsecase
  organize Licenses::FindLicenseSeatInteractor,
           Licenses::DestroyLicenseSeatInteractor
end
