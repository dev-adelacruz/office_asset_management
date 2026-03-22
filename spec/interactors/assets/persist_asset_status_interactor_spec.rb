# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::PersistAssetStatusInteractor do
  subject(:result) { described_class.call(asset: asset, status: "assigned") }

  let!(:asset) { create(:asset, status: :available) }

  it "succeeds" do
    expect(result).to be_success
  end

  it "updates the asset status" do
    result
    expect(asset.reload.status).to eq("assigned")
  end

  it "captures the previous status on context" do
    expect(result.previous_status).to eq("available")
  end

  it "does not create a new asset record" do
    expect { result }.not_to change(Asset, :count)
  end
end
