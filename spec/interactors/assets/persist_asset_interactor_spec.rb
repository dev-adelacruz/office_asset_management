# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::PersistAssetInteractor do
  subject(:result) { described_class.call(context_params) }

  describe "create path (no asset in context)" do
    let(:context_params) { { asset_params: attributes_for(:asset) } }

    it "succeeds" do
      expect(result).to be_success
    end

    it "creates a new Asset record" do
      expect { result }.to change(Asset, :count).by(1)
    end

    it "writes the new asset to context.asset" do
      expect(result.asset).to be_a(Asset)
      expect(result.asset).to be_persisted
    end
  end

  describe "update path (asset present in context)" do
    let!(:asset) { create(:asset) }
    let(:context_params) { { asset: asset, asset_params: { name: "Renamed Asset" } } }

    it "succeeds" do
      expect(result).to be_success
    end

    it "does not create a new record" do
      expect { result }.not_to change(Asset, :count)
    end

    it "updates the asset attributes" do
      expect(result.asset.name).to eq("Renamed Asset")
    end
  end

  describe "AR validation failure" do
    let(:context_params) { { asset_params: attributes_for(:asset, name: "") } }

    it "raises ActiveRecord::RecordInvalid" do
      expect { result }.to raise_error(ActiveRecord::RecordInvalid)
    end
  end
end
