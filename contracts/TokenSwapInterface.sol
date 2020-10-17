pragma solidity ^0.6.12;

/// @title Allows users to swap between two tokens.
/// Users can supply liquidity to earn a 5% transaction fee.  The tokens are of equal value.
interface TokenSwapInterface {

  /// @notice Allows a user to supply liquidity
  /// @param token The token that the user is supplying.  Must be one of the pair.
  /// @param amount The amount of the token that the user is supplying.
  /// @return The users ownership share of the liquidity
  function supply(address token, uint256 amount) external returns (uint256);

  /// @notice Allows a user to swap an amount of one token for another.  The tokens must both be of the swap pairs.
  /// @param have The token the user wants to supply
  /// @param amount The amount of token the user wants to swap
  /// @return The amount swapped, less the fee
  function swap(address have, uint256 amount) external returns (uint256);

  /// @notice Allows a user to redeem their liquidity.
  /// @param shares The number of shares the user wishes to redeem
  function redeem(uint256 shares) external;

  /// @notice Returns the underlying amount of a token that a user holds
  /// @param user The user whose underlying balance should be calculated
  /// @param token The token whose balance we want.  Must be one of the swap pair.
  /// @return The underlying balance of the given token for the users shares.
  function balanceOfUnderlying(address user, address token) external view returns (uint256);
}
