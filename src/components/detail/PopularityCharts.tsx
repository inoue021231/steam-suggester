"use client";

import { STEAM_COLOR_RANGE, TWITCH_COLOR_RANGE } from "@/constants/STYLES";
import CircularProgress from "@mui/material/CircularProgress";
import { NodeType } from "@/types/NetworkType";
import useSWR from "swr";
import { fetcher } from "../common/Fetcher";
import AreaRechart from "../charts/AreaRechart";
import { GetActiveUserResponse } from "@/types/api/getActiveUserType";

type Props = {
  node: NodeType;
};

const PopularityCharts = ({ node }: Props) => {
  const { data: steamData, error: steamError } = useSWR(
    node
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/countRecentSteamReviews/${node.steamGameId}`
      : null,
    fetcher
  );

  const { data: twitchData, error: twitchError } = useSWR(
    node && node.twitchGameId
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/details/getTwitchViews/${node.twitchGameId}`
      : null,
    fetcher
  );

  const { data: activeUsersData, error: activeUsersError } = useSWR<GetActiveUserResponse[]>(
    node
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getActiveUser/${node.steamGameId}`
      : null,
    fetcher
  );

  if (!node) {
    return (
      <div className="text-white text-center">ゲームが選択されていません。</div>
    );
  }

  if (steamError || twitchError || activeUsersError) {
    return (
      <div className="text-red-500 text-center">
        データの取得に失敗しました。
      </div>
    );
  }

  if (!steamData || !activeUsersData || (node.twitchGameId && !twitchData)) {
    return (
      <div className="flex justify-center items-center h-32">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2">
      {/* Steamレビュー数 */}
      <AreaRechart data={steamData} xKey="date" yKey="count" color={STEAM_COLOR_RANGE[0]} title="Steamレビュー数" />

      {/* Twitch視聴数 */}
      {node.twitchGameId && (
        <AreaRechart data={twitchData} xKey="date" yKey="count" color={TWITCH_COLOR_RANGE[0]} title="Twitch視聴数" />
      )}

      {/* アクティブユーザー数 */}
      <AreaRechart data={activeUsersData} xKey="get_date" yKey="active_user" color={STEAM_COLOR_RANGE[0]} title="アクティブユーザー数" />
    </div>
  );
};

export default PopularityCharts;