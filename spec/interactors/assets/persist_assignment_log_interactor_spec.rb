# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::PersistAssignmentLogInteractor do
  let!(:asset) { create(:asset) }
  let(:manager) { create(:user, :manager) }
  let(:employee) { create(:user, :employee) }
  let(:params) { { assigned_to_id: employee.id, assigned_at: Time.current } }

  subject(:result) do
    described_class.call(asset: asset, assignment_params: params, current_user: manager)
  end

  it "succeeds" do
    expect(result).to be_success
  end

  it "creates an AssetAssignmentLog record" do
    expect { result }.to change(AssetAssignmentLog, :count).by(1)
  end

  it "sets assigned_by to the current user" do
    expect(result.assignment_log.assigned_by).to eq(manager)
  end

  it "sets assigned_to from params" do
    expect(result.assignment_log.assigned_to).to eq(employee)
  end

  it "writes the log to context.assignment_log" do
    expect(result.assignment_log).to be_a(AssetAssignmentLog)
    expect(result.assignment_log).to be_persisted
  end
end
