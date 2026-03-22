# frozen_string_literal: true

class Assets::UpdateAssetStatusUsecase < ApplicationUsecase
  organize Assets::ValidateAssetStatusInteractor,
           Assets::PersistAssetStatusInteractor,
           Assets::LogAssetStatusChangeInteractor
end
