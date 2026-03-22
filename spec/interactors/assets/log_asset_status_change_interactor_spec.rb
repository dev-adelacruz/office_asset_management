# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::LogAssetStatusChangeInteractor do
  subject(:result) do
    described_class.call(
      asset: asset,
      previous_status: "available",
      status: "assigned",
      current_user: user
    )
  end

  let!(:asset) { create(:asset, status: :assigned) }
  let(:user) { create(:user, :manager) }

  it "succeeds" do
    expect(result).to be_success
  end

  it "creates an AssetStatusLog record" do
    expect { result }.to change(AssetStatusLog, :count).by(1)
  end

  it "sets the correct log fields" do
    log = result.asset_status_log
    expect(log.asset).to eq(asset)
    expect(log.changed_by).to eq(user)
    expect(log.from_status).to eq("available")
    expect(log.to_status).to eq("assigned")
  end
end
