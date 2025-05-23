"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import useSWR from "swr";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import Panel from "../../common/Panel";
import Section from "../Section";
import LogoutIcon from "@mui/icons-material/Logout";
import Image from "next/image";
import {
  Alert,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { fetcher } from "@/components/common/Fetcher";
import { NodeType } from "@/types/NetworkType";
import { changeGameIdData, getGameIdData } from "@/hooks/indexedDB";
import OwnedGameItem from "./OwnedGameItem";
import FriendGameItem from "./FriendGameItem";

type Props = {
  nodes: NodeType[];
  setSelectedIndex: (value: number) => void;
  setIsNetworkLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const SteamList = (props: Props) => {
  const { nodes, setSelectedIndex, setIsNetworkLoading } =
    props;

  const { data: session, status } = useSession();

  const steamId = session?.user?.email
    ? session.user.email.split("@")[0]
    : null;

  // 自分の所有ゲームを取得
  const { data: myOwnGames, error: myGamesError } = useSWR<
    GetSteamOwnedGamesResponse[]
  >(
    status === "authenticated" && steamId
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getSteamOwnedGames?steamId=${steamId}`
      : null,
    fetcher,
  );

  // フレンドの所有ゲームを取得
  const { data: friendsOwnGames, error: friendsGamesError } = useSWR<
    GetFriendGamesResponse[]
  >(
    status === "authenticated" && steamId
      ? `${process.env.NEXT_PUBLIC_CURRENT_URL}/api/network/getFriendGames?steamId=${steamId}`
      : null,
    fetcher,
  );

  if (status === "loading" || !session) {
    return (
      <Panel
        title="Steamゲーム一覧"
        icon={<SportsEsportsIcon className="mr-2 text-white" />}
      >
        <div className="flex justify-center items-center h-full">
          <div style={{ textAlign: "center" }}>
            <h2>Steamでログインしてゲームを表示</h2>
            <Button
              onClick={() => signIn("steam")}
              variant="outlined"
              sx={{ margin: "1rem" }}
            >
              Steamでログイン
            </Button>
            <Alert variant="filled" severity="info">
              表示するにはSteamプロフィールの公開設定を公開にしてください。
            </Alert>
          </div>
        </div>
      </Panel>
    );
  }


  if (myGamesError || friendsGamesError) {
    return (
      <Panel
        title="Steamゲーム一覧"
        icon={<SportsEsportsIcon className="mr-2 text-white" />}
      >
        <div className="flex justify-center items-center h-full">
          <p>データの取得中にエラーが発生しました。</p>
        </div>
      </Panel>
    );
  }

  if (!myOwnGames || !friendsOwnGames) {
    return (
      <Panel
        title="Steamゲーム一覧"
        icon={<SportsEsportsIcon className="mr-2 text-white" />}
      >
        <div className="flex justify-center items-center h-full">
          <p>読み込み中...</p>
        </div>
      </Panel>
    );
  }

  const handleGameInNode = (game: GetFriendGamesResponse) => {
    const nodeIndex = nodes.findIndex((node) => node.title == game.gameName);
    if (nodeIndex !== -1) {
      setSelectedIndex(nodeIndex);
    }
  };

  const descFriendsData = friendsOwnGames.sort(
    (prev: GetFriendGamesResponse, next: GetFriendGamesResponse) =>
      next.friends.length - prev.friends.length
  );

  const addOwnedGamesToNode = async () => {
    const newGames = myOwnGames.filter((game) =>
      !nodes.some((node) => node.steamGameId === game.id)
    );
    const gameIdData = await getGameIdData();
    await changeGameIdData([...(gameIdData || []), ...newGames.map((game) => game.id.toString())]);
    setIsNetworkLoading(true);
  };

  const addFriendGamesToNode = async () => {
    const newFriendGameIds = friendsOwnGames
      .map((game) => game.gameId)
      .filter((gameId) => !nodes.some((node) => node.steamGameId === gameId));

    const gameIdData = await getGameIdData();
    await changeGameIdData([...(gameIdData || []), ...newFriendGameIds]);
    setIsNetworkLoading(true);
  }

  const areAllMyOwnGamesInNodes = () => {
    return myOwnGames.every((game) =>
      nodes.some((node) => node.steamGameId === game.id)
    );
  };

  // フレンドの所有ゲームが nodes にすべて含まれているかを判別する関数
  const areAllFriendGamesInNodes = () => {
    return friendsOwnGames.every((game) =>
      nodes.some((node) => node.steamGameId === game.gameId)
    );
  };

  return (
    <Panel
      title={
        <div className="flex items-center">
          <span>Steam所有ゲーム一覧</span>
        </div>
      }
      icon={<SportsEsportsIcon className="mr-2 text-white" />}
    >
      <div className="text-white text-sm mb-4">
        自分の所有してるゲームは青色、フレンドの所有してるゲームは黄色の円枠で囲まれます。<br />
        どちらも所有してる場合は緑の円枠で囲まれます。
      </div>

      <div>
        <div className="flex items-center justify-between m-3">
          <div className="flex items-center">
            {session?.user && session.user.image ? (
              <Image
                src={session.user.image}
                alt="user"
                width={30}
                height={30}
                style={{ borderRadius: "50%" }}
              />
            ) : (
              <PersonIcon />
            )}
            <div className="ml-3">{session.user?.name}</div>
          </div>
          <Tooltip title="ログアウト">
            <IconButton onClick={() => signOut()} sx={{ color: "white" }}>
              <LogoutIcon sx={{ color: "white" }} />
            </IconButton>
          </Tooltip>
        </div>

        {/* 自分の所有ゲーム */}
        <Section title={`自分の所有ゲーム(${myOwnGames.length})`} icon={<PersonIcon />}>
          {!areAllMyOwnGamesInNodes() && <Button onClick={addOwnedGamesToNode} variant="outlined">追加してないゲームをすべて追加</Button>}
          <div className="bg-gray-700 p-2 rounded-lg overflow-y-auto ">
            {myOwnGames.length > 0 ? (
              myOwnGames.map((game) => {
                const nodeIndex = nodes.findIndex((node) => node.steamGameId == game.id);
                return (
                  <OwnedGameItem
                    key={game.title}
                    game={game}
                    onSelect={() => {
                      if (nodeIndex !== -1) setSelectedIndex(nodeIndex);
                    }}
                    nodeIndex={nodeIndex}
                  />
                );
              })
            ) : (
              <p className="text-center text-white">
                ゲームが見つかりませんでした。
              </p>
            )}
          </div>
        </Section>

        {/* フレンドの所有ゲーム */}
        <Section title={`フレンドの所有ゲーム(${friendsOwnGames.length})`} icon={<GroupIcon />}>
        {!areAllFriendGamesInNodes() && <Button onClick={addFriendGamesToNode} variant="outlined">追加してないゲームをすべて追加</Button>}
          <div className="bg-gray-700 p-2 rounded-lg overflow-y-auto">
            {friendsOwnGames.length > 0 ? (
              descFriendsData.map((game, index) => {
                const nodeIndex = nodes.findIndex((node) => node.steamGameId == game.gameId);
                return (
                <FriendGameItem
                  key={index}
                  game={game}
                  onSelect={() => handleGameInNode(game)}
                  nodeIndex={nodeIndex}
                  />
                );
              })
            ) : (
              <p className="text-center text-white">
                フレンドのゲームが見つかりませんでした。
              </p>
            )}
          </div>
        </Section>
      </div>
    </Panel>
  );
};

export default SteamList;
