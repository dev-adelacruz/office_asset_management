# frozen_string_literal: true

class Assets::UpdateAssetUsecase < ApplicationUsecase
  organize Assets::ValidateAssetParamsInteractor,
           Assets::PersistAssetInteractor
end
