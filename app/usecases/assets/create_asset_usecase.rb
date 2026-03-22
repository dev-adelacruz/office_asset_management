# frozen_string_literal: true

class Assets::CreateAssetUsecase < ApplicationUsecase
  organize Assets::ValidateAssetParamsInteractor,
           Assets::PersistAssetInteractor
end
