import { useRoute } from '@react-navigation/native';
import { Box, Code, FlatList, useToast } from 'native-base';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { EmptyMyPoolList } from './EmptyMyPoolList';
import { Game, GameProps } from './Game';
import { Loading } from './Loading';
import { PoolPros } from './PoolCard';

interface Props {
  poolId: string;
  code: string;
}

export function Guesses({ poolId }: Props) {
  const toast = useToast();
  const [games, setGames] = useState<GameProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [firstTeamPoints, setFirstTeamPoints] = useState('');
  const [secondTeamPoints, setSecondTeamPoints] = useState('');

  async function fetchGames(){
    try{
      setIsLoading(true);

      const response = await api.get(`/pools/${poolId}/games`);
      setGames(response.data.games);
    } catch(error){
      console.log(error);

      toast.show({
          title: "Não foi possível carregar os detalhes os jogos",
          placement: "top",
          bgColor: "red.500",
      })
    } finally{
        setIsLoading(false);
    }
  }

  async function handleGuessConfirm(gameId: string){
    try{
      if(!firstTeamPoints.trim() || !secondTeamPoints.trim()){
        return toast.show({
          title: (!firstTeamPoints.trim() && secondTeamPoints.trim()) ? "Informe o placar do primeiro time" : (!secondTeamPoints.trim() && firstTeamPoints.trim()) ? "Informe o placar do segundo time" : "Informe o placar do palpite",
          placement: "top",
          bgColor: "red.500",
      })
      }

      await api.post(`/pools/${poolId}/games/${gameId}/guesses`, {
        firstTeamPoints: Number(firstTeamPoints),
        secondTeamPoints: Number(secondTeamPoints),
      })

      toast.show({
        title: "Palpite realizado com sucesso",
        placement: "top",
        bgColor: "green.500",
    })

    fetchGames();
    }catch(error){
      console.log(error);

      toast.show({
          title: "Não foi possível enviar o palpite",
          placement: "top",
          bgColor: "red.500",
      })
    }
  }

  useEffect(() => {
    fetchGames();
  }, [poolId])

  if(isLoading){
    return(
      <Loading/>
    )
  }

  return (
    <FlatList
      data={games}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <Game
          data={item}
          setFirstTeamPoints={setFirstTeamPoints}
          setSecondTeamPoints={setSecondTeamPoints}
          onGuessConfirm={() => handleGuessConfirm(item.id)}
        />
      )}
      _contentContainerStyle={{pb: 10}}
      ListEmptyComponent={() => <EmptyMyPoolList code={code} />}
    />
  )
}
