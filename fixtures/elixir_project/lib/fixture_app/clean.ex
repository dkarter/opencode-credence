defmodule FixtureApp.Clean do
  @moduledoc false

  def empty?([]), do: true
  def empty?(_items), do: false

  def names_csv(users) do
    Enum.map_join(users, "", fn user -> user.name end)
  end
end
