defmodule FixtureApp.Problematic do
  @moduledoc false

  def empty?(items) do
    length(items) == 0
  end

  def score(values) do
    Enum.map(values, fn value -> value * 2 end)
    |> Enum.sum()
  end

  def names_csv(users) do
    Enum.map(users, fn user -> user.name end)
    |> Enum.join("")
  end
end
