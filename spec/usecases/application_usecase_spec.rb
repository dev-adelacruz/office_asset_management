# frozen_string_literal: true

require "rails_helper"

RSpec.describe ApplicationUsecase do
  # Throwaway interactors and usecase defined inline — not part of the app.
  # These exist solely to exercise the transaction wrapper.

  let(:write_interactor) do
    Class.new do
      include Interactor

      # Reads:  context.asset_attrs
      # Writes: context.asset
      def call
        context.asset = Asset.create!(context.asset_attrs)
      end
    end
  end

  let(:failing_interactor) do
    Class.new do
      include Interactor

      def call
        context.fail!(message: "intentional mid-chain failure")
      end
    end
  end

  describe "transaction rollback on mid-chain failure" do
    it "rolls back all prior DB writes when a later interactor calls context.fail!" do
      write_step = write_interactor
      fail_step = failing_interactor

      test_usecase = Class.new(ApplicationUsecase) do
        organize write_step, fail_step
      end

      asset_attrs = attributes_for(:asset)

      expect {
        test_usecase.call(asset_attrs: asset_attrs)
      }.not_to change(Asset, :count)
    end

    it "returns a failed context when a later interactor calls context.fail!" do
      write_step = write_interactor
      fail_step = failing_interactor

      test_usecase = Class.new(ApplicationUsecase) do
        organize write_step, fail_step
      end

      result = test_usecase.call(asset_attrs: attributes_for(:asset))

      expect(result).to be_failure
      expect(result.message).to eq("intentional mid-chain failure")
    end

    it "persists DB writes when all interactors succeed" do
      write_step = write_interactor

      test_usecase = Class.new(ApplicationUsecase) do
        organize write_step
      end

      expect {
        test_usecase.call(asset_attrs: attributes_for(:asset))
      }.to change(Asset, :count).by(1)
    end
  end
end
