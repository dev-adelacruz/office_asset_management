# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::SetAssetStatusAssignedInteractor do
  let!(:asset) { create(:asset, status: :available) }

  subject(:result) { described_class.call(asset: asset) }

  it "succeeds" do
    expect(result).to be_success
  end

  it "updates the asset status to assigned" do
    result
    expect(asset.reload.status).to eq("assigned")
  end

  it "does not create a new record" do
    expect { result }.not_to change(Asset, :count)
  end
end
