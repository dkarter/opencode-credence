defmodule FixtureApp.MixProject do
  use Mix.Project

  def project do
    [
      app: :fixture_app,
      version: "0.1.0",
      elixir: "~> 1.17",
      deps: deps()
    ]
  end

  def application do
    [extra_applications: [:logger]]
  end

  defp deps do
    [
      {:credence, "~> 0.5", only: [:dev, :test], runtime: false}
    ]
  end
end
